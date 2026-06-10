# Group Calendar Todo Architecture

## Data Model

Prisma/PostgreSQL 기준의 핵심 스키마 예시입니다.

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  avatarUrl     String?
  memberships   RoomMember[]
  createdTodos  Todo[]         @relation("CreatedTodos")
  assignedTodos Todo[]         @relation("AssignedTodos")
  completions   Contribution[]
  attachments   Attachment[]
  createdAt      DateTime       @default(now())
}

model Room {
  id          String       @id @default(cuid())
  name        String
  date        DateTime
  hostId      String
  inviteCode  String       @unique
  members     RoomMember[]
  todos       Todo[]
  createdAt   DateTime     @default(now())
}

model RoomMember {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  role      RoomRole @default(MEMBER)
  acceptedAt DateTime?
  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
}

model Todo {
  id             String         @id @default(cuid())
  roomId         String
  title          String
  status         TodoStatus     @default(TODO)
  priority       Priority       @default(MEDIUM)
  category       String
  dueAt          DateTime
  weight         Int            @default(1)
  createdById    String
  assigneeId     String?
  completedById  String?
  completedAt    DateTime?
  completionNote String?
  room           Room           @relation(fields: [roomId], references: [id])
  createdBy      User           @relation("CreatedTodos", fields: [createdById], references: [id])
  assignee       User?          @relation("AssignedTodos", fields: [assigneeId], references: [id])
  attachment     Attachment?
  contribution   Contribution?
  updatedAt      DateTime       @updatedAt
  createdAt      DateTime       @default(now())
}

model Attachment {
  id           String   @id @default(cuid())
  todoId       String   @unique
  uploadedById String
  fileName     String
  mimeType     String
  size         Int
  storageKey   String
  downloadUrl  String
  todo         Todo     @relation(fields: [todoId], references: [id])
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
  createdAt    DateTime @default(now())
}

model Contribution {
  id        String   @id @default(cuid())
  roomId    String
  todoId    String   @unique
  userId    String
  score     Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([roomId, userId])
}

enum RoomRole {
  HOST
  MEMBER
}

enum TodoStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## API Structure

```txt
POST   /api/rooms
GET    /api/rooms/:roomId
POST   /api/rooms/:roomId/invitations
POST   /api/invitations/:inviteCode/accept

GET    /api/rooms/:roomId/todos
POST   /api/rooms/:roomId/todos
PATCH  /api/todos/:todoId
DELETE /api/todos/:todoId

POST   /api/todos/:todoId/complete
GET    /api/todos/:todoId/attachment/download

GET    /api/rooms/:roomId/contributions
GET    /api/rooms/:roomId/events
```

`POST /api/todos/:todoId/complete`는 `multipart/form-data`로 `file`, `completionNote`를 함께 받고, 트랜잭션 안에서 `Todo.status`, `Attachment`, `Contribution`을 같이 저장합니다.

## Core Logic

완료 처리와 파일 업로드는 하나의 원자적 작업으로 묶습니다.

```ts
async function completeTodo(todoId: string, userId: string, file: File, note: string) {
  const uploaded = await storage.put(file);

  return prisma.$transaction(async (tx) => {
    const todo = await tx.todo.update({
      where: { id: todoId },
      data: {
        status: 'COMPLETED',
        completedById: userId,
        completedAt: new Date(),
        completionNote: note,
        attachment: {
          create: {
            uploadedById: userId,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            storageKey: uploaded.key,
            downloadUrl: uploaded.url
          }
        }
      }
    });

    await tx.contribution.upsert({
      where: { todoId },
      update: { userId, score: todo.weight },
      create: { roomId: todo.roomId, todoId, userId, score: todo.weight }
    });

    return todo;
  });
}
```

실시간 기여도는 완료된 할 일의 `weight` 합계를 기준으로 계산합니다.

```ts
function calculateContributions(todos: Todo[], members: RoomMember[]) {
  const completed = todos.filter((todo) => todo.status === 'COMPLETED' && todo.completedById);
  const totalScore = completed.reduce((sum, todo) => sum + todo.weight, 0);

  return members.map((member) => {
    const score = completed
      .filter((todo) => todo.completedById === member.userId)
      .reduce((sum, todo) => sum + todo.weight, 0);

    return {
      userId: member.userId,
      score,
      percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    };
  });
}
```

실서비스에서는 WebSocket 또는 SSE로 `todo.created`, `todo.updated`, `todo.completed`, `contribution.updated` 이벤트를 방 멤버에게 브로드캐스트하면 됩니다.
