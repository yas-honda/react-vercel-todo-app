
import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Task text is required and must be a non-empty string.' });
    }

    if (text.length > 255) {
      return res.status(400).json({ error: 'Task text must be 255 characters or less.' });
    }

    await sql`INSERT INTO tasks (text) VALUES (${text});`;
    
    return res.status(201).json({ message: 'Task added successfully' });
  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
