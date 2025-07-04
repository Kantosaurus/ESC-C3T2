import { elderSchema } from "@carely/core";
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

const elderFormSchema = z.object({
  name: elderSchema.shape.name,
  phone: elderSchema.shape.phone.unwrap().unwrap().optional(), // this makes it optional and not nullable for the form
  address: elderSchema.shape.address,
});

export type ElderFormType = z.infer<typeof elderFormSchema>;

export function ElderForm({
  defaultValues = {},
  onSubmit,
}: {
  defaultValues?: Partial<ElderFormType>;
  onSubmit: (values: ElderFormType) => Promise<void>;
}) {
  const form = useForm<ElderFormType>({
    resolver: zodResolver(elderFormSchema),
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
                <Input placeholder="Ah Ma" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed in the app. You may use
                their preferred name or nickname.
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
                Optional, We will use this in case of emergencies.
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
                This helps us tailor our services to your elder's location.
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
