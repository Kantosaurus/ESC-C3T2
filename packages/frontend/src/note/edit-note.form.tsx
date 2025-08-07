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
import { useNavigate, useParams } from "react-router";
import { useSpeechToText } from "./use-speech-to-text";
import { useEffect, useMemo, useState } from "react";
import { useEldersDetails } from "@/elder/use-elder-details";
import { http } from "@/lib/http";
import { toast } from "sonner";

const editNoteFormSchema = z.object({
  id: noteSchema.shape.id,
  header: noteSchema.shape.header,
  content: noteSchema.shape.content.optional(),
  assigned_elder_id: noteSchema.shape.assigned_elder_id,
});

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
  const elderDetails = result?.elderDetails ?? [];
  const [isSaving, setIsSaving] = useState(false);
  const { noteId } = useParams();
  const navigate = useNavigate();

  const form = useForm<EditNoteFormInput, unknown, EditNoteFormType>({
    resolver: zodResolver(editNoteFormSchema),
    defaultValues,
  });

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

  const handleSubmitWithUnlock = async (values: EditNoteFormType) => {
    setIsSaving(true);
    try {
      await onSubmit(values);
      await http().post(`/api/notes/${noteId}/unlock`);

      toast.success("Note saved successfully!");
      navigate("/notes");
    } catch (error: any) {
      console.error("Save failed:", error);

      // Attempt to unlock on failure (unless it's a lock conflict)
      if (error.response?.status !== 423) {
        await http().post(`/api/notes/${noteId}/unlock`).catch(console.error);
      }

      toast.error(error.response?.data?.message || "Failed to save note");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!defaultValues?.assigned_elder_id && elderDetails.length > 0) {
      form.setValue("assigned_elder_id", elderDetails[0].id.toString());
    }
  }, [elderId, elderDetails, form]);

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  useEffect(() => {
    if (transcript) {
      form.setValue("content", form.getValues("content") + transcript);
      setTranscript("");
    }
  }, [transcript]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitWithUnlock)}
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-slate-100 hover:bg-slate-200"
            type="button"
            onClick={() => navigate("/notes")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting || !form.formState.isDirty || isSaving
            }
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
