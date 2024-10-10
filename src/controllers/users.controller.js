import { PrismaClient } from '@prisma/client'




export const getUser = async (req, res) => {
    try {
      const _user = await prisma.usuarios.findUnique({
        where: { id: req.userId, state: true },
        select: {
          avatar: true,
          name: true,
          email: true,
          rol: true,
        },
      });
  
      const user = {
        ..._user,
        rol: _user.rol.name,
      };
  
      res.status(200).json(useSend("", user));
    } catch (err) {
      res.status(500).json(useSend(i18n.__("Failed to get user!")));
    }
  };