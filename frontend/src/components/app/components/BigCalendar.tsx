import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XInputField } from '@/components/custom/XInputField';
import { XTextareaField } from '@/components/custom/XTextareaField';
import moment from 'moment-timezone';
import AxiousInstance from '@/helper/AxiousInstance';
import { toast } from 'sonner';


const colorOptions = [
    { value: 'yellow', label: 'Yellow', color: '#eab308' },
    { value: 'green', label: 'Green', color: '#22c55e' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
    { value: 'orange', label: 'Orange', color: '#f97316' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
    { value: 'red', label: 'Red', color: '#ef4444' },
];

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Title is required')
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
        .max(500, 'Description must be less than 500 characters')
        .trim()
        .required('Description is required.'),
    start: Yup.string()
        .required('Start date and time is required'),
    end: Yup.string()
        .required('End date and time is required')
        .test('is-after-start', 'End time must be after start time', function (value) {
            const { start } = this.parent;
            if (!start || !value) return true;
            return moment.tz(value, 'Asia/Kolkata').isAfter(moment.tz(start, 'Asia/Kolkata'));
        }),
    color: Yup.string()
        .required('Color is required')
        .oneOf(colorOptions.map(c => c.value), 'Please select a valid color'),
});

const BigCalendar = () => {
    const calendarRef = useRef(null) as any;
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(moment.tz('Asia/Kolkata'));
    const [isMobile, setIsMobile] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null) as any;



    const getEvents = async () => {
        try {
            const response = await AxiousInstance.get('/calendar')
            if (response.status === 200) {
                console.log(response.data)
                setEvents(response.data.events)
            }
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    }


    useEffect(() => { getEvents() }, [])

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            start: '',
            end: '',
            color: 'blue'
        },
        validationSchema,
        onSubmit: (values) => {
            handleSaveEvent(values);
        },
        validateOnChange: false,
        validateOnBlur: true,
    });

    // Navigate to previous or next month
    const navigateMonth = (direction: string) => {
        const calendarApi = calendarRef?.current?.getApi();
        if (calendarApi) {
            if (direction === 'prev') {
                calendarApi.prev();
            } else {
                calendarApi.next();
            }
            setCurrentDate(moment.tz(calendarApi.getDate(), 'Asia/Kolkata')); // Update currentDate in IST
        }
    };

    const getMonthYear = () => {
        return currentDate.format('MMM YYYY');
    };

    const handleDateSet = (dateInfo: any) => {
        setCurrentDate(moment.tz(dateInfo.view.currentStart, 'Asia/Kolkata')); // IST for current month
    };

    const openAddEventSheet = (dateStr: any) => {
        setEditingEvent(null);
        const now = moment.tz('Asia/Kolkata'); // IST
        const startDateTime = dateStr ? moment.tz(dateStr, 'Asia/Kolkata').format('YYYY-MM-DDTHH:mm') : '';
        const endDate = dateStr ? moment.tz(dateStr, 'Asia/Kolkata').add(1, 'hour') : now.add(1, 'hour');
        const endDateTime = dateStr ? endDate.format('YYYY-MM-DDTHH:mm') : '';

        formik.resetForm({
            values: {
                title: '',
                description: '',
                start: startDateTime,
                end: endDateTime,
                color: 'blue'
            }
        });
        setIsSheetOpen(true);
    };

    const openEditEventSheet = (event: any) => {
        setEditingEvent(event);
        const startDate = moment.tz(event.start, 'Asia/Kolkata');
        const endDate = event.end ? moment.tz(event.end, 'Asia/Kolkata') : startDate.clone().add(1, 'hour');
        const selectedColor = colorOptions.find(c => c.color === event.backgroundColor)?.value || 'blue';

        formik.resetForm({
            values: {
                title: event.title || '',
                description: event.extendedProps?.description || '',
                start: startDate.format('YYYY-MM-DDTHH:mm'),
                end: endDate.format('YYYY-MM-DDTHH:mm'),
                color: selectedColor
            }
        });
        setIsSheetOpen(true);
    };

    const handleSaveEvent = async (values: any) => {
        try {

            const selectedColorOption = colorOptions.find(c => c.value === values.color);
            const eventData = {
                title: values.title,
                start: moment.tz(values.start, 'Asia/Kolkata').toISOString(),
                end: moment.tz(values.end, 'Asia/Kolkata').toISOString(),
                backgroundColor: selectedColorOption?.color || '#3b82f6',
                description: values.description,
            };

            if (editingEvent) {
                formik.setSubmitting(true)
                const response = await AxiousInstance.put(`/calendar/${editingEvent?.extendedProps?._id}`, eventData)
                if (response.status === 200) {
                    toast.success(response.data.message)
                    getEvents()
                    setIsSheetOpen(false);
                    setEditingEvent(null);
                }


            } else {
                const response = await AxiousInstance.post('/calendar', eventData)
                if (response.status === 201) {
                    toast.success(response.data.message)
                    getEvents()
                    setIsSheetOpen(false);
                    setEditingEvent(null);
                }
            }


        } catch (error: any) {
            toast.error(error.response.data.message || "Internal server error")
        }
        finally {
            formik.setSubmitting(false)
        }

    };

    const handleDeleteEvent = async () => {
        try {
            const res = window.confirm('Are you sure you want to delete this event')
            if (editingEvent && res) {
                const response = await AxiousInstance.delete(`/calendar/${editingEvent?.extendedProps?._id}`)
                if (response.status === 200) {
                    getEvents()
                    setIsSheetOpen(false);
                    setEditingEvent(null);

                }
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Internal server error")
        }

    };

    const handleSheetClose = () => {
        setIsSheetOpen(false);
        setEditingEvent(null);
        formik.resetForm();
    };

    return (
        <div className="w-full min-h-screen bg-background ">
            <div className="p-3 md:p-6 ">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-1 md:gap-2">
                        <Button
                            variant={'secondary'}
                            onClick={() => navigateMonth('prev')}
                            className="p-1.5 md:p-2"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <h2 className="text-3xl md:text-4xl">
                            {getMonthYear()}
                        </h2>
                    </div>
                    <div className='flex gap-2'>
                        <Button onClick={openAddEventSheet} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            {!isMobile && "Add Event"}
                        </Button>

                        <Button
                            variant={'secondary'}
                            onClick={() => navigateMonth('next')}
                            className="p-1.5 md:p-2"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
                        <SheetTrigger asChild>

                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</SheetTitle>
                                <SheetDescription>
                                    {editingEvent ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
                                </SheetDescription>
                            </SheetHeader>

                            <FormikProvider value={formik}>
                                <div className="grid gap-4 py-4 px-4">
                                    <div className="grid gap-2">
                                        <XInputField
                                            id="title"
                                            name="title"
                                            label="Title"
                                            type="text"
                                            className="h-11"
                                            placeholder="Add a title"
                                            value={formik.values.title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.title && formik.errors.title}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <XTextareaField
                                            id="description"
                                            name="description"
                                            label="Description"
                                            placeholder="Event description"
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.description && formik.errors.description}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="start">Start Date</Label>
                                        <Input
                                            id="start"
                                            name="start"
                                            type="datetime-local"

                                            value={formik.values.start}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`${formik.touched.start && formik.errors.start ? 'border-red-500' : ''} h-11 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden`}
                                        />
                                        {formik.touched.start && formik.errors.start && (
                                            <span className="text-red-500 text-sm">{formik.errors.start}</span>
                                        )}

                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="end">End Date  </Label>
                                        <Input
                                            id="end"
                                            name="end"
                                            type="datetime-local"
                                            value={formik.values.end}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`${formik.touched.end && formik.errors.end ? 'border-red-500' : ''} h-11 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden`}
                                        />
                                        {formik.touched.end && formik.errors.end && (
                                            <span className="text-red-500 text-sm">{formik.errors.end}</span>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color </Label>
                                        <Select
                                            value={formik.values.color}
                                            onValueChange={(value) => formik.setFieldValue('color', value)}

                                        >
                                            <SelectTrigger className={`${formik.touched.color && formik.errors.color ? 'border-red-500' : ''} w-full py-[21px] `} >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent >
                                                {colorOptions.map((colorOption) => (
                                                    <SelectItem key={colorOption.value} value={colorOption.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-border"
                                                                style={{ backgroundColor: colorOption.color }}
                                                            />
                                                            {colorOption.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.color && formik.errors.color && (
                                            <span className="text-red-500 text-sm">{formik.errors.color}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2  justify-center mt-4">
                                        {editingEvent && (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                onClick={handleDeleteEvent}
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {!isMobile && "Delete"}
                                            </Button>
                                        )}
                                        <Button type="button" variant="outline" onClick={handleSheetClose}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={formik.handleSubmit as any}
                                            disabled={formik.isSubmitting}
                                        >
                                            {editingEvent ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </div>
                            </FormikProvider>
                        </SheetContent>
                    </Sheet>


                </div>
                {/* FullCalendar Component */}
                <div className="border border-border rounded-lg overflow-hidden">
                    <FullCalendar
                        initialDate={currentDate.toDate()} // Use currentDate in IST
                        weekends={true}
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        headerToolbar={false}
                        height="auto"
                        moreLinkClick="popover"
                        eventDisplay="block"
                        aspectRatio={isMobile ? 1.5 : 2.5}
                        dayHeaderFormat={{ weekday: 'short' }}
                        dayHeaderContent={isMobile ? undefined : (date) => date.date.toLocaleDateString('en-US', { weekday: 'long' })}
                        dayHeaderClassNames="!border-b !border-border !p-2 md:!p-4 !text-xs md:!text-sm !font-medium !text-muted-foreground !bg-card "
                        dayCellClassNames="!border-r !border-b !border-border hover:!bg-accent/20 !transition-colors !p-2 md:!p-3 "
                        eventClassNames="!text-xs !rounded-sm !border !border-[var(--border)] !p-0.5 md:!p-1 !mb-0.5 !truncate !cursor-pointer hover:!opacity-80 !transition-opacity !flex !items-center !gap-1.5 !bg-transparent "
                        datesSet={handleDateSet}
                        eventContent={(eventInfo) => {
                            const dotColor = eventInfo.event.backgroundColor || '#3b82f6';
                            return (
                                <div className="w-full  flex items-center gap-1.5 !pr-4 !pl-1 !py-1.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    ></span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-xs leading-tight !text-[var(--foreground)]  ">
                                            {eventInfo.event.title}
                                        </span>
                                        <span className="opacity-75 text-xs leading-tight !text-[var(--foreground)]">
                                            {moment.tz(eventInfo.event.start, 'Asia/Kolkata').format('h:mm A')} {/* Display time in IST */}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                        eventClick={(eventInfo) => {
                            openEditEventSheet(eventInfo.event);
                        }}
                        dateClick={(dateInfo) => {
                            openAddEventSheet(dateInfo.dateStr);
                        }}
                    />
                </div>
            </div>
        </div >
    );
};

export default BigCalendar;