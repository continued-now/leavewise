import { z } from 'zod';

export const ReminderType = z.enum([
  'pto_reset', // Remind before PTO year resets
  'booking_deadline', // Remind X days before window starts
  'weekly_digest', // Weekly summary of PTO usage
]);

export const ReminderPreferencesSchema = z.object({
  email: z.string().email(),
  reminders: z.array(ReminderType).min(1),
  country: z.enum(['US', 'KR']),
  ptoResetMonth: z.number().min(1).max(12).optional(),
  windows: z
    .array(
      z.object({
        startStr: z.string(),
        endStr: z.string(),
        label: z.string(),
      })
    )
    .optional(),
});

export type ReminderPreferences = z.infer<typeof ReminderPreferencesSchema>;
export type ReminderTypeValue = z.infer<typeof ReminderType>;

export const REMINDER_LABELS: Record<
  ReminderTypeValue,
  { title: string; description: string }
> = {
  pto_reset: {
    title: 'PTO Reset Reminder',
    description: 'Get notified 30 days before your PTO resets',
  },
  booking_deadline: {
    title: 'Booking Deadline',
    description: 'Reminder to book before your vacation window',
  },
  weekly_digest: {
    title: 'Weekly PTO Digest',
    description: 'Weekly summary of your remaining PTO',
  },
};
