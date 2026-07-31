// app/lib/auth-utils.js
import crypto from 'crypto';

// Simular um "banco de dados" de usuários em memória
// Em produção, isso seria um banco de dados real
let usersDatabase = [
  {
    id: 'user_demo_001',
    email: 'demo@example.com',
    name: 'Usuário Demo',
    passwordHash: simpleHash('demo123456'), // senha: demo123456
    phone: '(11) 98765-4321',
    location: 'São Paulo, Brasil',
    avatar: 'https://api.placeholder.com/avatar',
    joinDate: new Date('2024-01-15').toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Função para simular hash de senha (em produção usar bcrypt)
export function simpleHash(password) {
  return crypto.createHash('sha256').update(password + 'salt_relatory').digest('hex');
}

// Validar se email já existe
export function emailExists(email) {
  return usersDatabase.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Buscar usuário por email
export function getUserByEmail(email) {
  return usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Criar novo usuário
export function createUser(name, email, password) {
  const userId = 'user_' + crypto.randomBytes(8).toString('hex');
  const newUser = {
    id: userId,
    email,
    name,
    passwordHash: simpleHash(password),
    phone: '',
    location: '',
    avatar: undefined,
    joinDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  usersDatabase.push(newUser);
  return newUser;
}

// Gerar JWT token (simulado - em produção usar jsonwebtoken)
export function generateToken(userId, email, rememberMe = false) {
  const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // segundos
  const tokenCreatedAt = Date.now();
  const tokenExpiresAt = tokenCreatedAt + (expiresIn * 1000);
  
  // Payload
  const payload = {
    userId,
    email,
    iat: Math.floor(tokenCreatedAt / 1000),
    exp: Math.floor(tokenExpiresAt / 1000),
  };
  
  // Simular token (em produção usar jwt.sign)
  const tokenString = Buffer.from(JSON.stringify(payload)).toString('base64');
  const token = crypto
    .createHash('sha256')
    .update(tokenString + 'secret_key_relatory')
    .digest('hex');
  
  return {
    token: token + '.' + tokenString,
    expiresAt: new Date(tokenExpiresAt).toISOString(),
    expiresIn,
  };
}

// Validar token
export function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [hash, payload] = parts;
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

// Verificar credenciais
export function validateCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) {
    return null;
  }

  const passwordHash = simpleHash(password);
  if (user.passwordHash !== passwordHash) {
    return null;
  }

  return user;
}

// Obter dados públicos do usuário (sem senha)
export function getUserPublicData(userId) {
  const user = usersDatabase.find(u => u.id === userId);
  if (!user) {
    return null;
  }

  const { passwordHash, ...publicData } = user;
  return publicData;
}
