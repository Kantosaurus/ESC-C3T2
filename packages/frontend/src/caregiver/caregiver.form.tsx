import { caregiverSchema } from "@carely/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const caregiverFormSchema = caregiverSchema.pick({
  name: true,
  phone: true,
  address: true,
});

export type CaregiverFormType = z.infer<typeof caregiverFormSchema>;

export function CaregiverForm({
  defaultValues = {},
  onSubmit,
}: {
  defaultValues?: Partial<CaregiverFormType>;
  onSubmit: (values: CaregiverFormType) => Promise<void>;
}) {
  const form = useForm<CaregiverFormType>({
    resolver: zodResolver(caregiverFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Tan Ah Kao" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed in the app. You may use
                your preferred name or nickname.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="91234567" {...field} />
              </FormControl>
              <FormDescription>
                Optional, we will use this to contact you only in case of
                emergencies.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Block 123 Ang Mo Kio" {...field} />
              </FormControl>
              <FormDescription>
                Optional, but helps us to know where you are located.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          Done
        </Button>
      </form>
    </Form>
  );
}
