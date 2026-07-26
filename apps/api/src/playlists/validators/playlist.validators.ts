import { BadRequestException } from '@nestjs/common';

export function validateReorderPayload(items: Array<{ episodeId: string; position: number }>) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestException('At least one item is required');
  }

  const positions = items.map((item) => item.position);
  const hasDuplicatePositions = new Set(positions).size !== positions.length;
  if (hasDuplicatePositions) {
    throw new BadRequestException('Positions must be unique');
  }

  const hasInvalidPosition = positions.some((position) => position < 1);
  if (hasInvalidPosition) {
    throw new BadRequestException('Positions must be greater than zero');
  }
}
