const createHolidayActivities = async (holidayDate, holidayStatus) => {
    try {
        const employees = await Employee.findAll(); // Fetch all employees

        for (const employee of employees) {
            const activity = await Activity.findOne({
                where: { employeeId: employee.id, actionDate: holidayDate },
            });

            if (activity) {
                // Update existing activity to 'férié'
                await activity.update({ status: holidayStatus });
            } else {
                // Create new activity for 'férié'
                await Activity.create({
                    employeeId: employee.id,
                    actionDate: holidayDate,
                    status: holidayStatus,
                    inTime: null,
                    outTime: null,
                    numberOfMissions: 0,
                    //createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
    } catch (error) {
        console.error('Failed to create holiday activities:', error);
    }
};
