var consts = {
	
	WEAK_PWD: 'Hasło musi się składać z co najmniej 8 znaków oraz zawierać co najmniej 3 z następujących:\n- małą literę\n- wielką literę\n- cyfrę\n- znak specjalny',
	PWD_CHNG_DONE: "Hasło zostało zmienione.",
	WRONG_PWD:  "Błędne hasło.",
	LOGGED_ID: 'Zalogovano. Identyfikator: ',
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
	SET_PWD: 'Ustaw nowe hasło:',
	PWD_MUST_CHANGE: 'Musisz zmienić hasło. Powód: upłynął czas zmiany hasła lub zostało to wymuszone przez administratora serwera.',
	
	ART_ADDED: "Dodano nowy artykuł.",
	ACC_ADDED: "Dodano nowe konto.",
	
	ERR:  "Wystąpił błąd.",
	SAVED: "Zapisano.",
	DELETED: "Usunięto.",
	
	UNKWN_REQ: 'Nieznane żądanie',
};

for(var k in consts){
	exports[k] = consts[k];
};