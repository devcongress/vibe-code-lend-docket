import { z } from 'zod';

const JobMessageSchema = z.object({
  id: z.uuid(),
  type: z.enum(['attachment.scan', 'export.csv', 'export.pdf']),
  version: z.literal(1),
});

export async function handleJobBatch(batch: MessageBatch<unknown>): Promise<void> {
  for (const message of batch.messages) {
    const parsed = JobMessageSchema.safeParse(message.body);

    if (!parsed.success) {
      console.error(JSON.stringify({ event: 'job.rejected', messageId: message.id }));
      message.ack();
      continue;
    }

    console.warn(
      JSON.stringify({
        event: 'job.unimplemented',
        messageId: message.id,
        jobId: parsed.data.id,
        jobType: parsed.data.type,
      }),
    );
    message.retry({ delaySeconds: 60 });
  }
}
