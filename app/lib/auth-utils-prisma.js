import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'd9f3a2c8b7e14f9a9c2f5d8a6b3c4d1e';
const JWT_EXPIRY = '24h';

/**
 * Hash de senha com bcryptjs
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} - Hash da senha
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica se a senha é válida
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado no banco
 * @returns {Promise<boolean>} - True se válido, False caso contrário
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Gera token JWT
 * @param {object} payload - Dados do token
 * @returns {string} - Token JWT
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload do token ou null se inválido
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Busca usuário por email no banco de dados
 * @param {string} email - Email do usuário
 * @returns {Promise<object|null>} - Usuário encontrado ou null
 */
export async function getUserByEmail(email) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        phone: true,
        location: true,
        avatar: true,
        joinDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Cria novo usuário no banco de dados
 * @param {object} userData - { name, email, password, phone?, location? }
 * @returns {Promise<object|null>} - Usuário criado ou null se erro
 */
export async function createUser(userData) {
  try {
    const { name, email, password, phone = null, location = null } = userData;

    // Verifica se email já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Cria usuário no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        location,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        avatar: true,
        joinDate: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Valida credenciais de login
 * @param {string} email - Email do usuário
 * @param {string} password - Senha em texto plano
 * @returns {Promise<object|null>} - Dados do usuário se válido, null caso contrário
 */
export async function validateCredentials(email, password) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Retorna dados do usuário sem a senha
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
}

/**
 * Atualiza informações do usuário
 * @param {string} userId - ID do usuário
 * @param {object} updateData - Dados a atualizar
 * @returns {Promise<object|null>} - Usuário atualizado ou null
 */
export async function updateUser(userId, updateData) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        avatar: true,
        joinDate: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Deleta um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} - True se deletado com sucesso
 */
export async function deleteUser(userId) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * @param {string} userId 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<boolean>} 
 */
export async function changePassword(userId, newPassword) {
  try {
    // 1. Gerar o novo hash da senha
    const passwordHash = await hashPassword(newPassword);

    // 2. Atualizar diretamente no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: passwordHash },
    });

    return updatedUser;
  } catch (error) {
    console.error('Erro no banco ao alterar senha:', error);
    return null;
  }
}