import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "POST") {
    const {
      body: { question, latitude, longitude },
      session: { user },
    } = req;
    const post = await client.post.create({
      data: {
        question,
        latitude,
        longitude,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    res.json({ ok: true, post });
  }

  if (req.method === "GET") {
    const {
      query: { latitude, longitude },
    } = req;
    console.log(latitude, longitude);

    const parsedLatitude = parseFloat(latitude.toString());
    const parsedLongitude = parseFloat(longitude.toString());
    const posts = await client.post.findMany({
      where: {
        latitude: {
          gte: parsedLatitude - 0.1,
          lte: parsedLatitude + 0.1,
        },
        longitude: {
          gte: parsedLongitude - 0.1,
          lte: parsedLongitude + 0.1,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            answers: true,
            wonderings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(posts);
    res.json({ ok: true, posts });
  }
}

export default withApiSession(
  withHandler({ methods: ["POST", "GET"], handler })
);
