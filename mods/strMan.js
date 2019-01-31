var consts = { // string constants to handle client side errors and notifications
	
	pl:{
		WEAK_PWD: 'Hasło musi się składać z co najmniej 8 znaków oraz zawierać co najmniej 3 z następujących:\n- małą literę\n- wielką literę\n- cyfrę\n- znak specjalny',
		PWD_CHNG_DONE: "Hasło zostało zmienione.",
		WRONG_PWD:  "Błędne hasło.",
		LOGGED_ID: 'Zalogowano. Identyfikator: ',
		LOGGED_OUT: 'Wylogowano pomyślnie',
		NOT_LOGGED_ID: 'Musisz się zalogować, aby wykonać tą czynność.',
		ACC_NOT_VERIFIED: "Konto nie zostało zweryfikowane. Aktywuj konto poprzez otrzymany e-mail.\nMożesz wysłać ponownie e-mail weryfikacyjny na podany e-mail:\n",
		INV_CREDENTIALS: "Błędne hasło lub login.",
		INV_USERNAME: 'Nazwa użytkownika może zawierać tylko znaki łacińcie i cyfry',
		PWD_NOT_IDENTICAL: 'Hasła muszą być indentyczne',
		PWD_IDENTICAL: 'Nie możesz ustawić takiego samego hasła, jak poprzednie.',
		INV_EMAIL: 'Niepoprawny e-mail',
		VER_EMAIL_SENT: "Na podany email został wysłany e-mail weryfikayjny. Prosimy o aktywowanie konta przez otrzymany link lub wklejenie go poniżej.\n",
		USERNAME_EXISTS: "Taka nazwa konta już istnieje.",
		EMAIL_EXISTS: "Taki e-mail już istnieje.",
		ERR_TRY_AGAIN: "Wystąpił ściśle określony błąd. Spróbuj ponownie.",
		VER_EMAIL_QUOTA_EXCEEDED: "Nie możesz wysłać więcej e-maili weryfikacyjnych.",
		ACC_ALREADY_VERIFIED: "To konto zostało już aktywowane.",
		ACC_NOT_EXISTS: "Takie konto nie istnieje.",
		ACC_VER_DONE: "Konto zostało aktywowane. Zaloguj się.",
		WRONG_VER_CODE: "Ten kod aktywacyjny nie działa. Sprawdź pisownię i spróbuj ponownie.\n",
		INV_TITLE: 'Tytuł musi zawierać co najmniej 3 znaki oraz polskie litery, liczby lub takie znaki: -+=\'"/:;,.',
		INV_DATE: 'Niewłaściwy format daty. Wymagany: rrrr-mm-dd',
		INV_VAL: 'Niewłaściwa wartość',
		SET_PWD: 'Ustaw nowe hasło:',
		PWD_MUST_CHANGE: 'Musisz zmienić hasło. Powód: upłynął czas zmiany hasła lub zostało to wymuszone przez administratora serwera.',
		DATE_OUT: 'Nie możesz użyć daty wcześniejszej niż data utworzenia Twojego konta.',
		DEL_ACC_ART: 'Usunięto konto oraz ##n artykułów przypisanych do konta',
		
		SQL_OK: 'Zapytanie wykonano pomyślnie:',
		
		ART_ADDED: "Dodano nowy artykuł.",
		ACC_ADDED: "Dodano nowe konto.",
		
		ERR:  "Wystąpił błąd.",
		SAVED: "Zapisano.",
		DELETED: "Usunięto.",
		
		CFG_OK: "Konfiguracja została zmieniona.",
		
		UNKWN_REQ: 'Nieznane żądanie',
	
	},
	
	en:{
		WEAK_PWD: 'Password has to consist of at least 8 letters and contain at least 3 of the following:\n- lowercase letter\n- uppercase letter\n- digit\n- special char',
		PWD_CHNG_DONE: "Password has been changed.",
		WRONG_PWD:  "Wrong password.",
		LOGGED_ID: 'Logged in. UID: ',
		LOGGED_OUT: 'Logged out.',
		NOT_LOGGED_ID: 'You have to be loggen in to perform this.',
		ACC_NOT_VERIFIED: "The account has not been verified yet. Verify that using the e-mail you get. You can send an secondary activation link: \n",
		INV_CREDENTIALS: "Wrong password or login",
		INV_USERNAME: 'Username should contain only EN letters and/or digits.',
		PWD_NOT_IDENTICAL: 'Passwords have to be identical',
		PWD_IDENTICAL: 'You cannot set the same password as previously.',
		INV_EMAIL: 'Invalid email.',
		VER_EMAIL_SENT: "An verification email has been sent on a given address. Please activate your account using the link or pasting the code below.\n",
		USERNAME_EXISTS: "This user name already exists.",
		EMAIL_EXISTS: "This email already exists",
		ERR_TRY_AGAIN: "An error has been occurred. Try again.",
		VER_EMAIL_QUOTA_EXCEEDED: "You cannot send more activation emails.",
		ACC_ALREADY_VERIFIED: "This accounts has been activated already.",
		ACC_NOT_EXISTS: "This account does not exist.",
		ACC_VER_DONE: "The account has been activated. Please log in",
		WRONG_VER_CODE: "This activation code does not work. Check your code and try again.\n",
		INV_TITLE: 'Title has to contain at least 3 chars and polish letters, digits or these chars: -+=\'"/:;,.',
		INV_DATE: 'Invalid date format. Required: rrrr-mm-dd',
		INV_VAL: 'Invalid value.',
		SET_PWD: 'Set your password:',
		PWD_MUST_CHANGE: 'You have to change your password. Is has decayed or specified by an server administrator.',
		DATE_OUT: 'Your cannot use this date. It is earlier that date of your account creation!',
		DEL_ACC_ART: 'Removed account and ##n articles binded at.',
		
		SQL_OK: 'SQL request executed successfully:',
		
		ART_ADDED: "Added new article.",
		ACC_ADDED: "Added new account.",
		
		ERR:  "An error has been occurred.",
		SAVED: "Saved.",
		DELETED: "Deleted.",
		
		CFG_OK: "Configuration changed.",
		
		UNKWN_REQ: 'Unknown request',
	}
};

for(var k in consts){
	exports[k] = consts[k];
};