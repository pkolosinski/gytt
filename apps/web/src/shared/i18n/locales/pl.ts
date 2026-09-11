import type { Dictionary } from './en.ts';

export const pl: Dictionary = {
    common: {
        cancel: 'Anuluj',
        close: 'Zamknij',
        delete: 'Usuń',
        dismiss: 'Zamknij',
        edit: 'Edytuj',
        open: 'Otwórz',
        retry: 'Ponów',
        retrying: 'Ponawianie…',
        today: 'Dzisiaj',
    },
    app: {
        home: 'Strona główna GYTT',
        menu: 'Menu',
        openMenu: 'Otwórz menu',
        collapseSidebar: 'Zwiń panel boczny',
        expandSidebar: 'Rozwiń panel boczny',
        preferences: 'Preferencje',
        darkTheme: 'Ciemny motyw',
        language: 'Język',
        sections: {
            dashboard: 'Pulpit',
            tasks: 'Zadania',
            habits: 'Nawyki',
        },
    },
    dashboard: {
        eyebrow: 'Get Your Things Together',
        title: 'Niech dzisiejszy dzień się liczy.',
        subtitle: 'Spokojne miejsce na to, co chcesz robić i robić dalej.',
        modulesLabel: 'Moduły GYTT',
        today: 'Dzisiaj',
        modules: {
            tasks: {
                title: 'Zadania',
                description: 'Planuj, porządkuj i kończ swoje codzienne sprawy.',
                prompt: 'Zamień plany w jasny następny krok.',
                openLabel: 'Otwórz zadania',
            },
            habits: {
                title: 'Nawyki',
                description:
                    'Buduj regularność dzięki codziennym, tygodniowym i miesięcznym nawykom.',
                prompt: 'Podtrzymuj rutyny, które mają znaczenie.',
                openLabel: 'Otwórz nawyki',
            },
        },
    },
    placeholder: {
        badge: 'Wersja robocza',
        cardTitle: 'Przestrzeń robocza już wkrótce',
        cardDescription: 'Ścieżka jest podłączona i gotowa na kolejny etap wdrożenia.',
        ready: 'Nawigacja modułu {{module}} jest gotowa.',
        notIncluded: 'Logika domenowa i zapisane dane nie są częścią tej wersji roboczej.',
        backToDashboard: 'Wróć do pulpitu',
    },
    habits: {
        title: 'Nawyki',
        description:
            'Dzienne, tygodniowe i miesięczne widoki nawyków pomogą Ci utrzymać rutyny, które mają znaczenie.',
    },
    tasks: {
        title: 'Zadania',
        newTask: 'Nowe zadanie',
        notMovedTitle: 'Nie przeniesiono zadania',
        status: {
            todo: 'Do zrobienia',
            inProgress: 'W toku',
            completed: 'Ukończone',
        },
        navigation: {
            label: 'Daty zadań',
            previousDay: 'Poprzedni dzień',
            nextDay: 'Następny dzień',
            goToDate: 'Przejdź do daty',
        },
        dateNotFound: {
            heading: 'Nie znaleziono daty',
            title: 'To nie jest data kalendarzowa',
            description: '„{{value}}” nie jest poprawną datą w formacie RRRR-MM-DD.',
            dashboard: 'Pulpit',
            todaysTasks: 'Dzisiejsze zadania',
        },
        boardError: {
            title: 'Tablica zadań jest niedostępna',
            description:
                'Lokalna usługa nie mogła wczytać tej daty. Nic na tablicy nie zostało zmienione.',
        },
        board: {
            label: 'Tablica zadań',
            loading: 'Wczytywanie zadań',
            fallbackTitle: 'Zadanie',
            noColumn: 'żadną kolumną',
            dragStart: 'Podniesiono „{{title}}”.',
            dragOver: '„{{title}}” jest nad: {{column}}.',
            dragEnd: '„{{title}}” upuszczono w: {{column}}.',
            dropOutside: '„{{title}}” upuszczono poza kolumnami i nie zostało przeniesione.',
            dragCancel: 'Anulowano przenoszenie „{{title}}”.',
            instructions: 'Otwórz szczegóły zadania, aby zmienić jego status.',
        },
        column: {
            count: '{{count}} w: {{status}}',
            create: 'Utwórz',
            createIn: 'Utwórz zadanie w: {{status}}',
        },
        card: {
            since: 'Od {{date}}',
        },
        statusMenu: {
            trigger: '{{status}}: przenieś „{{title}}”',
            moveTo: 'Przenieś do',
        },
        moves: {
            moved: 'Przeniesiono „{{title}}” do: {{status}}.',
            conflict:
                '„{{title}}” zmieniono w innym miejscu, więc nie zostało przeniesione. Tablica pokazuje teraz jego najnowszy status.',
            invalid: '„{{title}}” nie zostało przeniesione. {{reason}}',
            unavailable:
                'Nie udało się przenieść „{{title}}”, ponieważ lokalna usługa nie odpowiedziała. Spróbuj ponownie.',
        },
        modal: {
            createTitle: 'Utwórz nowe zadanie',
            taskTitle: 'Zadanie',
            editTitle: 'Edytuj zadanie',
            loading: 'Wczytywanie zadania…',
            unavailableTitle: 'Zadanie niedostępne',
            unavailableDescription: 'Nie udało się wczytać zadania z lokalnej usługi.',
            description: 'Opis:',
            deleteTitle: 'Usunąć zadanie?',
            deleteDescription: 'Trwale usunąć „{{title}}”? Tej operacji nie można cofnąć.',
            deleteTask: 'Usuń zadanie',
            deleting: 'Usuwanie…',
            notDeletedTitle: 'Nie usunięto zadania',
            deleteConflict:
                'To zadanie zmieniono w innym miejscu, więc nie zostało usunięte. Tablica pokazuje teraz jego najnowszy status. Spróbuj ponownie.',
            deleteNotFound: 'To zadanie już nie istnieje.',
            deleteUnavailable: 'Lokalna usługa nie mogła usunąć zadania. Spróbuj ponownie.',
        },
        editor: {
            conflictTitle: 'To zadanie zmieniono w innym miejscu',
            conflictDescription:
                'Nowsza zapisana wersja zastąpiła Twoją edycję. Przejrzyj ją i w razie potrzeby zapisz ponownie.',
            reloadFailedTitle: 'Zadanie zmieniono w innym miejscu',
            reloadFailedDescription:
                'Istnieje nowsza wersja, ale nie udało się jej wczytać. Twój szkic został zachowany; spróbuj ponownie później.',
            notSavedTitle: 'Nie zapisano zadania',
            draftKept: '{{detail}} Twój szkic został zachowany.',
            saveUnavailable: 'Lokalna usługa nie mogła zapisać zadania.',
            title: 'Tytuł',
            description: 'Opis',
            optional: '(opcjonalnie)',
            saving: 'Zapisywanie…',
            create: 'Utwórz zadanie',
            save: 'Zapisz zmiany',
        },
        validation: {
            titleRequired: 'Wpisz tytuł.',
            tooLong: 'Użyj maksymalnie {{max}} znaków.',
            startDateInvalid: 'Wybierz poprawną datę rozpoczęcia.',
        },
    },
};
