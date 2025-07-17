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
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardData } from "../dashboard/use-dashboard-data";
import { useNavigate } from "react-router";

const addNoteFormSchema = z.object({
    header: noteSchema.shape.header,
    content: noteSchema.shape.content.optional(),
    assigned_elder_id: noteSchema.shape.assigned_elder_id,
});

// export type AddNoteFormType = z.infer<typeof addNoteFormSchema>;
export type AddNoteFormType = z.input<typeof addNoteFormSchema>;

export function AddNoteForm({
    defaultValues = { header: "", content: "", assigned_elder_id: "" }, // empty string keeps <select> empty
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

    const navigate = useNavigate();

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
                                    value={field.value === undefined ? "" : Number(field.value)} // convert to number 
                                //     onChange={e => field.onChange(Number(e.target.value))} 
                                >
                                    <SelectOption value="">
                                        {isLoadingRecipients ? "Loading…" : "Select a name"}
                                    </SelectOption>
                                    {elderDetails?.map(e => (
                                        <SelectOption key={e.id} value={e.id}>
                                            {e.name}
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
                                <Input placeholder="Add note header" {...field} required />
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
                <Button variant="outline" className="mr-2 bg-slate-100 onHover:bg-slate-200"
                    type="button" onClick={() => navigate("/notes")}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    Done
                </Button>
            </form>
        </Form>
    );
}
