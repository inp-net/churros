-- AlterTable
ALTER TABLE "_ContributionOptionToStudentAssociation" ADD CONSTRAINT "_ContributionOptionToStudentAssociation_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ContributionOptionToStudentAssociation_AB_unique";

-- AlterTable
ALTER TABLE "_EventToPromotion" ADD CONSTRAINT "_EventToPromotion_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventToPromotion_AB_unique";

-- AlterTable
ALTER TABLE "_MajorToMinor" ADD CONSTRAINT "_MajorToMinor_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MajorToMinor_AB_unique";

-- AlterTable
ALTER TABLE "_MajorToSchool" ADD CONSTRAINT "_MajorToSchool_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MajorToSchool_AB_unique";

-- AlterTable
ALTER TABLE "_MajorToSubject" ADD CONSTRAINT "_MajorToSubject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MajorToSubject_AB_unique";

-- AlterTable
ALTER TABLE "_MajorToTicket" ADD CONSTRAINT "_MajorToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MajorToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_MinorToSubject" ADD CONSTRAINT "_MinorToSubject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MinorToSubject_AB_unique";

-- AlterTable
ALTER TABLE "_SchoolToTicket" ADD CONSTRAINT "_SchoolToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SchoolToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_ThemeToUser" ADD CONSTRAINT "_ThemeToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ThemeToUser_AB_unique";

-- AlterTable
ALTER TABLE "_autojoin" ADD CONSTRAINT "_autojoin_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_autojoin_AB_unique";

-- AlterTable
ALTER TABLE "_bannedFromEvents" ADD CONSTRAINT "_bannedFromEvents_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_bannedFromEvents_AB_unique";

-- AlterTable
ALTER TABLE "_coOrganizer" ADD CONSTRAINT "_coOrganizer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_coOrganizer_AB_unique";

-- AlterTable
ALTER TABLE "_completedForms" ADD CONSTRAINT "_completedForms_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_completedForms_AB_unique";

-- AlterTable
ALTER TABLE "_defaultApplicableOffers" ADD CONSTRAINT "_defaultApplicableOffers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_defaultApplicableOffers_AB_unique";

-- AlterTable
ALTER TABLE "_eventManagerInviteUses" ADD CONSTRAINT "_eventManagerInviteUses_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_eventManagerInviteUses_AB_unique";

-- AlterTable
ALTER TABLE "_formsWithMarkedCheckbox" ADD CONSTRAINT "_formsWithMarkedCheckbox_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_formsWithMarkedCheckbox_AB_unique";

-- AlterTable
ALTER TABLE "_invitedTo" ADD CONSTRAINT "_invitedTo_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_invitedTo_AB_unique";

-- AlterTable
ALTER TABLE "_openTo" ADD CONSTRAINT "_openTo_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_openTo_AB_unique";

-- AlterTable
ALTER TABLE "_partiallyCompletedForms" ADD CONSTRAINT "_partiallyCompletedForms_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_partiallyCompletedForms_AB_unique";

-- AlterTable
ALTER TABLE "_related" ADD CONSTRAINT "_related_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_related_AB_unique";

-- AlterTable
ALTER TABLE "_restrictedTo" ADD CONSTRAINT "_restrictedTo_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_restrictedTo_AB_unique";

-- AlterTable
ALTER TABLE "_seenBy" ADD CONSTRAINT "_seenBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_seenBy_AB_unique";

-- AlterTable
ALTER TABLE "_shares" ADD CONSTRAINT "_shares_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_shares_AB_unique";

-- AlterTable
ALTER TABLE "_studentAssociationAdmins" ADD CONSTRAINT "_studentAssociationAdmins_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_studentAssociationAdmins_AB_unique";

-- AlterTable
ALTER TABLE "_studentAssociationGroupsEditor" ADD CONSTRAINT "_studentAssociationGroupsEditor_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_studentAssociationGroupsEditor_AB_unique";
