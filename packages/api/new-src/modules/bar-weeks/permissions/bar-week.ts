export const userCanEditBarWeeks = (user: User): boolean =>
    user?.admin || user?.canEditGroups || (process.env.FOY_GROUPS?.split(',') ?? []).some(uid => userIsOnBoardOf(uid, user))
                    

export const userCanSeeBarWeek = (user: User, group: Group): boolean  =>
    userIsStudentOfSchool(user, group.school.uid)
                    
