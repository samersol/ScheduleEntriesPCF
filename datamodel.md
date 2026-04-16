erDiagram
    
    
    
    tblEmployee {
        GUID        tblEmployeeId
        string      strEmployeeNumber "PK"
        string      strFirstName
        string      strLasName
        string      strPhoneNumber
        double      dblWeeklyWorkHours
        date        dteLastTrainingDate
        date        dteTrainingExpiryDate
        date        dteDateOfBirth
        string      strEmployeeRole
        formular    fxFullName
        reference   refMainCostCenter
        reference   refGroup
    }

    tblVacation {
        GUID        tblVacationId
        autonumber  autVacationNumber
        integer     intYear
        double      dblVacationAllowanceDays
        double      dblCarriedOverDays
        reference   refEmployee
    }
    
    tblCustomer {
        GUID tblCustomerId
        string      strCustomerNumber "PK"
        string      strCustomerName
        string      strPostalCode
        string      strCity
        string      strStreet
        string      strHouseNumber
        formular    fxFullAddress
        multistring strNote
        
    }

    tblGroup {
        GUID tblGroupId
        autonumber  autGroupNumber "PK"
        string      strTitle

    }

    tblGroupUser {
        GUID        tblGroupUserId
        autonumber  autGroupUserNumber "PK"
        boolean     blnIsMainUser
        reference   refGroup
        reference   refSiteManager "tblUser"
    }
    
    tblCostCenter {
        GUID        tblCostCenterId
        string      strCostCenterNumber "PK"
        string      strTitle
        multistring strNote
        reference   refCustomer
        reference   refGroup

    }

    tblScheduleEntry {
        GUID        tblScheduleEntryId
        autonumber  autScheduleEntryNumber
        datetime    dteDateFrom
        datetime    dteDateTo
        integer     intPause
        multistring strNote
        formular    fxDuration
        reference   refEmployee
        reference   refCostCenter
    }


    tblAbsenceEntry {
        GUID        tblAbsenceEntryId
        autonumber   autAbsenceEntryNumber
        date        dteDateStart
        date        dteDateEnd
        integer     intVacationDays
        choice      choAbsenceType
        multistring strNote
        integer     intWorkDays     "nur Urlaubstagen"
        formular    fxDuration
        reference   refEmployee
    }

    tblMonthlySettlement {
        GUID        tblMonthlySettlementId
        autonumber   autMonthlySettlementNumber
        integer     intMonth
        integer     intYear    
        boolean     blnIsApproved
        boolean     blnIsTransferredToSAP
        reference   refEmployee

    }



    tblUser {
        GUID        tblUserId
        string      strAzureId      "PK"
        choice      choUserRole
        reference   refEmployee
    }



    tblEmployee ||--o{ tblAbsenceEntry : refEmployee
    tblEmployee ||--o{ tblScheduleEntry : refEmployee
    tblCostCenter ||--o{ tblScheduleEntry : refCostCenter
    tblEmployee ||--o{ tblUser : refEmployee


    tblEmployee ||--o{ tblVacation : refEmployee
    tblEmployee ||--o{ tblMonthlySettlement : refEmployee
    tblGroup ||--o{ tblMonthlySettlement : refGroup


    tblGroup ||--o{ tblGroupUser : refGroup
    tblUser ||--o{ tblGroupUser : refSiteManager




    tblCustomer ||--o{ tblCostCenter : refCustomer
    tblGroup ||--o{ tblCostCenter : refGroup
    


%% -------------------- Optionsets --------------------
OptionSets {

    Choices choUserRole         "Admin, Verwaltungsmitarbeiter, Planer"
    Choices choEmployeeRole     "Reinigungskraft, Vorarbeiter, Objektleiterin"
    Choices choAbsenceType      "Urlaub, Krank, Unentschuldigtes Fehlen, Kind Krank, Sonderurlaub, Sonstiges"
    Choices choTrainingStatus   "Fehlt, Gültig, Abgelaufen"

}