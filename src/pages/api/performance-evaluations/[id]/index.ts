import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { performanceEvaluationValidationSchema } from 'validationSchema/performance-evaluations';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.performance_evaluation
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getPerformanceEvaluationById();
    case 'PUT':
      return updatePerformanceEvaluationById();
    case 'DELETE':
      return deletePerformanceEvaluationById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getPerformanceEvaluationById() {
    const data = await prisma.performance_evaluation.findFirst(
      convertQueryToPrismaUtil(req.query, 'performance_evaluation'),
    );
    return res.status(200).json(data);
  }

  async function updatePerformanceEvaluationById() {
    await performanceEvaluationValidationSchema.validate(req.body);
    const data = await prisma.performance_evaluation.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deletePerformanceEvaluationById() {
    const data = await prisma.performance_evaluation.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
