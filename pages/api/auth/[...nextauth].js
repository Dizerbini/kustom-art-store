import bcryptjs from 'bcryptjs';
import NextAuth from 'next-auth/next';
import CredendialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/User';
import db from '../../../utils/db';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?._id) token._id = user._id;
      if (user?.isAdmin) token.isAdmin = user.isAdmin;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?._id) session.user_isAdmin = token.isAdmin;
      return session;
    },
  },

  providers: [
    CredendialsProvider({
      async authorize(credendials) {
        await db.connect();
        const user = await User.findOne({
          email: credendials.email,
        });
        await db.disconnect();
        if (user && bcryptjs.compareSync(credendials.password, user.password)) {
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: 'f',
            isAdmin: user.isAdmin,
          };
        }
        throw new Error('Email ou senha não estão corretos');
      },
    }),
  ],
});
