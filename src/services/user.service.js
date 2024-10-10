import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();


export const getUserAccountService = async id_users => {
	try {
		const userAccountInfo = await prisma.usuarios.findFirst({
			where: {
				id: id_users,
			},
		});

		if (!userAccountInfo) {
			throw new Error('Usuario no encontrado.');
		}

		return userAccountInfo;
	} catch (error) {
		console.error('Error al buscar al usuario: ', error);
		throw error;
	}
};


export const getAllUsersService = async () => {
	try {
		const userAccountInfo = await prisma.usuarios.findMany();

		if (!userAccountInfo) {
			throw new Error('0 users found in the database.');
		}

		return userAccountInfo;
	} catch (error) {
		console.error('Error searching users information: ', error);
		throw error;
	}
};
