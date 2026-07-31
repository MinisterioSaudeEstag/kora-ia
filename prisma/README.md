# Prisma Database Schema

## Overview

Este é o schema do banco de dados PostgreSQL para o Relatory, gerenciado via Prisma ORM.

## Models

### 1. User
Armazena informações de usuários do sistema.

```prisma
model User {
  id        String     @id @default(cuid())
  name      String
  email     String     @unique
  passwordHash String
  phone     String?
  location  String?
  avatar    String?
  joinDate  DateTime   @default(now())
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  documents Document[]
  questions Question[]
}
```

**Campos:**
- `id` - Identificador único (CUID)
- `name` - Nome completo do usuário
- `email` - Email único (username de login)
- `passwordHash` - Hash bcrypt da senha
- `phone` - Telefone (opcional)
- `location` - Localização/cidade (opcional)
- `avatar` - URL da foto de perfil (opcional)
- `joinDate` - Data de cadastro
- `createdAt` - Timestamp de criação
- `updatedAt` - Timestamp de última atualização

---

### 2. Document
Armazena informações sobre arquivos PDF enviados pelos usuários.

```prisma
model Document {
  id                  String   @id @default(cuid())
  userId              String
  nome_arquivo        String
  caminho_armazenamento String
  data_upload         DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions Question[]
}
```

**Campos:**
- `id` - Identificador único (CUID)
- `userId` - Foreign Key para User
- `nome_arquivo` - Nome original do arquivo
- `caminho_armazenamento` - Caminho/URL onde o arquivo está armazenado
- `data_upload` - Timestamp do upload
- `updatedAt` - Timestamp de última atualização

**Relacionamentos:**
- Pertence a um `User`
- Tem múltiplas `Question`s
- Se o usuário for deletado, o documento é deletado (CASCADE)

---

### 3. Question
Armazena histórico de perguntas e respostas (chat).

```prisma
model Question {
  id          String   @id @default(cuid())
  userId      String
  documentId  String
  pergunta    String
  resposta    String?
  data_criacao DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}
```

**Campos:**
- `id` - Identificador único (CUID)
- `userId` - Foreign Key para User
- `documentId` - Foreign Key para Document
- `pergunta` - Pergunta feita pelo usuário
- `resposta` - Resposta gerada pela IA (pode ser null até ser respondida)
- `data_criacao` - Timestamp da pergunta
- `updatedAt` - Timestamp de última atualização

**Relacionamentos:**
- Pertence a um `User`
- Pertence a um `Document`
- Se o usuário for deletado, a pergunta é deletada (CASCADE)
- Se o documento for deletado, a pergunta é deletada (CASCADE)

---

## Migrations

### Primeira Migração
Quando tudo está pronto, execute:
```bash
npx prisma db push
```

Isto criará as 3 tabelas no PostgreSQL com todos os índices e relacionamentos.

### Após Modificações
Se modificar o schema.prisma, execute novamente:
```bash
npx prisma db push
```

---

## Índices

Estão criados índices nas seguintes colunas para performance:

- `User.email` - UNIQUE (necessário para login)
- `Document.userId` - INDEX (buscar documentos de um usuário)
- `Question.userId` - INDEX (buscar perguntas de um usuário)
- `Question.documentId` - INDEX (buscar perguntas de um documento)

---

## Constraints

### Foreign Keys (Relacionamentos)
- `Document.userId` → `User.id` (ON DELETE CASCADE)
- `Question.userId` → `User.id` (ON DELETE CASCADE)
- `Question.documentId` → `Document.id` (ON DELETE CASCADE)

### Unique Constraints
- `User.email` - Garante que não há dois usuários com o mesmo email

---

## Timestamps

Todos os modelos têm:
- `createdAt` - Criado automaticamente com a data atual
- `updatedAt` - Atualizado automaticamente em cada mudança

Para User e Document:
- `createdAt` e `updatedAt` são campos padrão

Para Document:
- `data_upload` - Timestamp customizado do upload

Para Question:
- `data_criacao` - Timestamp customizado da pergunta

---

## Seeding (Dados Iniciais)

Você pode criar um arquivo `prisma/seed.ts` ou `prisma/seed.js` para popular o banco com dados iniciais:

```javascript
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash: 'hash_da_senha', // Usar bcryptjs para hash real
    },
  });

  console.log('Seeding completed:', user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Depois configure em `package.json`:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

E execute:
```bash
npx prisma db seed
```

---

## Visualizar Dados

Para ver e editar dados em tempo real:

```bash
npx prisma studio
```

Abre uma interface web em `http://localhost:5555`

---

## Boas Práticas

1. **Sempre use Prisma ORM** em vez de queries SQL diretas
2. **Valide dados** antes de criar/atualizar
3. **Use relacionamentos** em vez de query joins manuais
4. **Trate erros** com try/catch
5. **Use select/include** para otimizar queries
6. **Nunca exponha** `passwordHash` nas respostas da API

---

## Referências

- [Prisma Schema Documentation](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Data Types](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string)
- [Field and Type Modifiers](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#field-and-type-modifiers)
- [Relationships](https://www.prisma.io/docs/concepts/relations)
