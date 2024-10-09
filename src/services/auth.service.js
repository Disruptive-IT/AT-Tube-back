import bcrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userRegisterService = async (userInformation) => {
	try {
		const {
			document_type_id,
			document_number,
			name,
			departament,
			city,
            adress,
            phone,
            email,
			password,
			role_id,
			status,
		} = userInformation;

		const verifyIfUserExists = await prisma.user.findFirst({
			where: {
				email,
			},
		});

		if (verifyIfUserExists) {
			throw new Error('Ya hay un usuario registrado en el sistema con ese correo electrónico.');
		}

		const verifyIfDocumentExists = await prisma.user.findFirst({
			where: {
				document_number,
			},
		});

		if (verifyIfDocumentExists) {
			throw new Error('Ya hay un usuario registrado en el sistema con ese número de documento.');
		}

		const hashPassword = await bcrypt.hash(password, 10);


		const newUser = await prisma.user.create({
			data: {
				document_types: { connect: { id: document_type_id } },
				document_number,
				name,
				departament,
                city,
                adress,
                phone,
				email,
                password,
				role: { connect: { id: role_id } },
                status,
				credentials: { create: { password: hashPassword } },
			},
			select: {
				id: true,
				name: true,
                departament: true,
				city: true,
                adress:true,
				email: true,
				role: true,
			},
		});
	} catch (error) {
		console.error('Error creating new user: ', error);
		throw error;
	}
};