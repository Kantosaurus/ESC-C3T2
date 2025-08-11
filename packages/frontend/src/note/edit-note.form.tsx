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
import { useNavigate } from "react-router-dom";
import { useSpeechToText } from "./use-speech-to-text";
import { useEffect } from "react";
import { useEldersDetails } from "@/elder/use-elder-details";
import { User, FileText, Mic, MicOff, Save, X } from "lucide-react";

const editNoteFormSchema = z.object({
  id: noteSchema.shape.id,
  header: noteSchema.shape.header,
  content: noteSchema.shape.content.optional(),
  assigned_elder_id: z.string().min(1, "Please select a care recipient"),
});

export type EditNoteFormType = z.infer<typeof editNoteFormSchema>;
export type EditNoteFormInput = z.input<typeof editNoteFormSchema>;

export function EditNoteForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: Partial<EditNoteFormType>;
  onSubmit: (values: {
    id: number;
    header: string;
    content?: string | null;
    assigned_elder_id: number;
  }) => Promise<void>;
}) {
  const { elderDetails, isLoading: isLoadingRecipients } = useEldersDetails();

  const form = useForm<EditNoteFormInput, unknown, EditNoteFormType>({
    resolver: zodResolver(editNoteFormSchema),
    defaultValues,
  });

  const navigate = useNavigate();

  const {
    transcript,
    listening,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechToText();

  useEffect(() => {
    // Reset the form values when defaultValues change
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Ensure assigned_elder_id is converted to string for the Select component
      const formValues = {
        ...defaultValues,
        assigned_elder_id: defaultValues.assigned_elder_id?.toString() || "",
      };
      form.reset(formValues);
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
      <form
        onSubmit={form.handleSubmit((values) => {
          console.log("Form returned values:", values);
          // Convert assigned_elder_id back to number for API
          const apiValues = {
            ...values,
            assigned_elder_id: values.assigned_elder_id
              ? Number(values.assigned_elder_id)
              : 0,
          };
          return onSubmit(apiValues);
        })}
        className="space-y-8"
      >
        {/* Care Recipient Selection */}
        <FormField
          control={form.control}
          name="assigned_elder_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <User className="h-4 w-4" />
                Care Recipient
              </FormLabel>
              <FormControl>
                <Select
                  required
                  disabled={isLoadingRecipients}
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20">
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
              <FormDescription className="text-gray-600 dark:text-gray-400">
                Select the care recipient this note is related to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note Header */}
        <FormField
          control={form.control}
          name="header"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <FileText className="h-4 w-4" />
                Note Title
              </FormLabel>
              <FormControl>
                <Input
                  data-testid="note-header-edit-input"
                  placeholder="Enter a clear title for your note..."
                  {...field}
                  required
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20"
                />
              </FormControl>
              <FormDescription className="text-gray-600 dark:text-gray-400">
                A descriptive title helps you find this note easily later
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <FileText className="h-4 w-4" />
                Note Content
              </FormLabel>

              {/* Voice Input Button */}
              <div className="flex items-center gap-3 mb-3">
                <Button
                  type="button"
                  variant={listening ? "destructive" : "outline"}
                  size="sm"
                  onClick={listening ? stopListening : startListening}
                  className="gap-2 transition-all duration-200"
                >
                  {listening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Voice Input
                    </>
                  )}
                </Button>
                {listening && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Recording...
                  </div>
                )}
              </div>

              <FormControl>
                <Textarea
                  data-testid="note-content-edit-input"
                  placeholder="Add your note content here... You can include reminders, medical information, dosage instructions, or any other important details."
                  rows={6}
                  {...field}
                  value={field.value || ""}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </FormControl>
              <FormDescription className="text-gray-600 dark:text-gray-400">
                Optional. Add detailed content including tasks, reminders,
                medical information, or dosage instructions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden fields for form data */}
        <input type="hidden" {...form.register("id")} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            data-testid="cancel-edit-note-button"
            variant="outline"
            type="button"
            onClick={() => navigate("/notes")}
            className="flex-1 sm:flex-none gap-2 h-12"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            data-testid="submit-edit-note-button"
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            className="flex-1 sm:flex-none gap-2 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Save className="h-4 w-4" />
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
