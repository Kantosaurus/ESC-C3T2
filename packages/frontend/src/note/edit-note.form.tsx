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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { useSpeechToText } from "./use-speech-to-text";
import { useEffect, useMemo } from "react";
import { useEldersDetails } from "@/elder/use-elder-details";

const editNoteFormSchema = z.object({
  id: noteSchema.shape.id,
  header: noteSchema.shape.header,
  content: noteSchema.shape.content.optional(),
  assigned_elder_id: noteSchema.shape.assigned_elder_id,
});

// export type AddNoteFormType = z.infer<typeof addNoteFormSchema>;
export type EditNoteFormType = z.infer<typeof editNoteFormSchema>;
export type EditNoteFormInput = z.input<typeof editNoteFormSchema>;

export function EditNoteForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: Partial<EditNoteFormType>;
  onSubmit: (values: EditNoteFormType) => Promise<void>;
}) {
  const result = useEldersDetails();
  const elderDetails = useMemo(() => result?.elderDetails ?? [], [result?.elderDetails]);

  const form = useForm<EditNoteFormInput, unknown, EditNoteFormType>({
    resolver: zodResolver(editNoteFormSchema),
    defaultValues,
  });

  const navigate = useNavigate();

  const elderId = form.watch("assigned_elder_id");
  
  const assignedElderName = useMemo(() => {
    if (!elderDetails.length || elderId == null) return "Loading...";
    const elder = elderDetails?.find((e) => e.id === elderId);
    return elder?.name ?? "Unknown";
  }, [elderDetails, elderId]);
    

  const {
    transcript,
    listening,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechToText();

  useEffect(() => {
    // Set the default value for assigned_elder_id if not already set
    if (!defaultValues?.assigned_elder_id && elderDetails.length > 0) {
      form.setValue("assigned_elder_id", elderDetails[0].id.toString());
    }
  }, [defaultValues?.assigned_elder_id, elderDetails, form]);

  useEffect(() => {
    // Reset the form values if form is mounted before data is ready
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

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
        <FormItem>
          <FormLabel>Name of Care Recipient</FormLabel>
          <p className="text-md font-semibold">{assignedElderName}</p>
          <FormDescription>
            You cannot modify the care recipient that this note is related to.
          </FormDescription>
          <FormMessage />
        </FormItem>
        <input type="hidden" {...form.register("assigned_elder_id")} />
        <input type="hidden" {...form.register("id")} />

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
          Save changes
        </Button>
      </form>
    </Form>
  );
}
