import { noteSchema } from "@carely/core";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { useSpeechToText } from "./use-speech-to-text";
import { useEffect } from "react";
import { useEldersDetails } from "@/elder/use-elder-details";

const addNoteFormSchema = z.object({
  header: noteSchema.shape.header,
  content: noteSchema.shape.content.optional(),
  assigned_elder_id: noteSchema.shape.assigned_elder_id,
});

// export type AddNoteFormType = z.infer<typeof addNoteFormSchema>;
export type AddNoteFormType = z.infer<typeof addNoteFormSchema>;
export type AddNoteFormInput = z.input<typeof addNoteFormSchema>;

export function AddNoteForm({
  onSubmit,
}: {
  defaultValues?: Partial<AddNoteFormType>;
  onSubmit: (values: AddNoteFormType) => Promise<void>;
}) {
  const { elderDetails, isLoading: isLoadingRecipients } = useEldersDetails();

  const form = useForm<AddNoteFormInput, unknown, AddNoteFormType>({
    resolver: zodResolver(addNoteFormSchema),
  });

  const navigate = useNavigate();

  const elderId = form.watch("assigned_elder_id");

  const {
    transcript,
    listening,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechToText();

  useEffect(() => {
    // Set the default value for assigned_elder_id if not already set
    if (!elderId && elderDetails && elderDetails.length > 0) {
      form.setValue("assigned_elder_id", elderDetails[0].id.toString());
    }
  }, [elderId, elderDetails, form]);

  // This updates the form content field every time speech is transcribed
  useEffect(() => {
    if (transcript) {
      form.setValue("content", form.getValues("content") + transcript);
      setTranscript(""); // clear internal transcript so future additions are new
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  return (
    <Form {...form}>
      {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> */}
      <form
        onSubmit={form.handleSubmit((values) => {
          console.log("Form returned values:", values); // log the returned values
          return onSubmit(values);
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="assigned_elder_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of Care Recipient</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  required
                  disabled={isLoadingRecipients}
                  value={field.value as string}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a care recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {elderDetails?.map((e) => (
                      <SelectItem key={e.id.toString()} value={e.id.toString()}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the care recipient's name that this note is related to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="header"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header</FormLabel>
              <FormControl>
                <Input placeholder="Add note header" {...field} required />
              </FormControl>
              <FormDescription>
                Add a header for the top of the note to search for this note
                easily.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <Button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={listening ? "bg-red-500" : "bg-green-500"}
              >
                {listening ? "Stop Voice" : "Start Voice"}
              </Button>

              <FormControl>
                <Textarea
                  placeholder="Feed medication at 10am and 7pm. Both take after meals. Take blood pressure at noon"
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Optional. Add note content here. You can add to-do tasks,
                reminders, medical information and dosage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="outline"
          className="mr-2 bg-slate-100 hover:bg-slate-200"
          type="button"
          onClick={() => navigate("/notes")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
        >
          Done
        </Button>
      </form>
    </Form>
  );
}
