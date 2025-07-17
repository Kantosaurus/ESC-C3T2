import { notesSchema, type Elder } from "@carely/core";
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
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardData } from "../dashboard/use-dashboard-data";
// import { type Notes } from "@carely/core/notes/notes.schema";

const addNoteFormSchema = z.object({
    elder_name: notesSchema.shape.elder_name,
    header: notesSchema.shape.header,
    content: notesSchema.shape.content,
});

export type AddNoteFormType = z.infer<typeof addNoteFormSchema>;

export function AddNoteForm({
    defaultValues = {},
    onSubmit,
}: {
    defaultValues?: Partial<AddNoteFormType>;
    onSubmit: (values: AddNoteFormType) => Promise<void>;
}) {
    const { elderDetails, isLoading: isLoadingRecipients } = useDashboardData();

    const form = useForm<AddNoteFormType>({
        resolver: zodResolver(addNoteFormSchema),
        defaultValues,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="elder_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Care Recipient</FormLabel>
                            <FormControl>
                                <Select {...field} disabled={isLoadingRecipients}>
                                    <SelectOption value="">
                                        {isLoadingRecipients ? "Loading..." : "Select a care recipient"}
                                    </SelectOption>
                                    {elderDetails?.map((elder: Elder) => (
                                        <SelectOption key={elder.id} value={elder.name}>
                                            {elder.name}
                                        </SelectOption>
                                    ))}
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
                                <Input placeholder="Add note header" {...field} />
                            </FormControl>
                            <FormDescription>
                                Add a header for the top of the note to search for this note easily.
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
                            <FormControl>
                                <Textarea
                                 placeholder="Feed medication at 10am and 7pm. Both take after meals. Take blood pressure at noon"
                                    rows={4}
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormDescription>
                                Optional. Add note content here. You can add to-do tasks, reminders, medical information and dosage.
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
