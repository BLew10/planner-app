import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import styles from './PurchaseDayType.module.scss';
import 'react-calendar/dist/Calendar.css';

interface PurchaseDayTypeProps {
    year: number;
    month: number; // 0-indexed (January = 0, December = 11)
}

const PurchaseDayType: React.FC<PurchaseDayTypeProps> = ({ year, month }) => {
    const [selectedDays, setSelectedDays] = useState<Date[]>([]);
    const [activeStartDate, setActiveStartDate] = useState(new Date(year, month));

    const handleDaySelect = (date: Date) => {
        const isSelected = selectedDays.some(selectedDate =>
            selectedDate.getTime() === date.getTime()
        );
        if (isSelected) {
            setSelectedDays(selectedDays.filter(selectedDate => selectedDate.getTime() !== date.getTime()));
        } else {
            setSelectedDays([...selectedDays, date]);
        }
        console.log(selectedDays);
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const isSelected = selectedDays.some(selectedDate =>
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear()
            );
            return isSelected ? styles.selectedDay : '';
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return (
        <div className={styles.container}>
          <h3 className={styles.monthName}>{monthNames[month]}</h3>
            <Calendar
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(new Date(year, month))}
                onClickDay={handleDaySelect}
                tileClassName={tileClassName}
                calendarType='gregory'
                view="month"
                showNavigation={false}
                showFixedNumberOfWeeks={true}
                formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
            />
        </div>
    );
};

export default PurchaseDayType;
