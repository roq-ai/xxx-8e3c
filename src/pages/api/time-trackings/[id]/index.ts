import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { timeTrackingValidationSchema } from 'validationSchema/time-trackings';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.time_tracking
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getTimeTrackingById();
    case 'PUT':
      return updateTimeTrackingById();
    case 'DELETE':
      return deleteTimeTrackingById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getTimeTrackingById() {
    const data = await prisma.time_tracking.findFirst(convertQueryToPrismaUtil(req.query, 'time_tracking'));
    return res.status(200).json(data);
  }

  async function updateTimeTrackingById() {
    await timeTrackingValidationSchema.validate(req.body);
    const data = await prisma.time_tracking.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deleteTimeTrackingById() {
    const data = await prisma.time_tracking.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
