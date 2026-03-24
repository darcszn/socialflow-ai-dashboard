import { Router, Request, Response } from 'express';
import { generateHashtagSuggestions } from '../services/hashtagGeneratorService';

const router = Router();

router.get('/hashtags', async (req: Request, res: Response) => {
  const text = typeof req.query.text === 'string' ? req.query.text.trim() : '';
  const platform = typeof req.query.platform === 'string' ? req.query.platform : 'instagram';
  const maxTagsValue = typeof req.query.maxTags === 'string' ? Number.parseInt(req.query.maxTags, 10) : 10;
  const useAi = req.query.useAi !== 'false';

  if (!text) {
    res.status(400).json({
      error: 'The "text" query parameter is required.',
    });
    return;
  }

  const maxTags = Number.isFinite(maxTagsValue) && maxTagsValue > 0 ? Math.min(maxTagsValue, 20) : 10;

  try {
    const result = await generateHashtagSuggestions({
      text,
      platform,
      maxTags,
      useAi,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate hashtags.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;