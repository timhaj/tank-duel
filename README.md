# Tank Duel
1v1 local game, aspired from Tank Trouble

Because I do not own the tank icons and the music, I would like to thank:

https://icons8.com for providing download free icons, and

QubeSounds, for providing royalty free music, used in this project (https://pixabay.com/music/rock-powerful-energetic-sport-rock-trailer-122077/)

------------------------------------------------------------------------------------------------------------
Kratek opis igre:

Tank Duel - igra, kjer se 2 igralca spopadeta v labirintu, ki je na vsako zmago ter na začetku igre naključno generiran. Vsak igralce lahko po določenem časovnem intervalu sproži bullet, s katerim lahko 
ubije nasprotnika in pa tudi sebe. Na vsake 10 sekund se na naključni celici v labirintu postavi power up - laser (rdeči krog, ki se polni). Igralec, ki pobere laser, ima samo 1 "šanso", da uporabi laser, če zgreši, laserja 
več nima. Zmaga tisti, ki prvi pride do 10 točk. Po vsaki končani igri, se v localStorage shranijo podatki obeh igralcev  (ime ter število zmag). V scoreboard meni-ju, dobimo podatke najboljših igralcev (navaden bubble sort 
nad številom zmag igralcev). V settings meni-ju, lahko katerikoli igralec izbere svoje keybind-e, ter določi svoje ime. Ko klikne na svoje ime, ga spreminja toliko časa, dokler ne klikne ENTER. Če se zgodi, da sta isti tipki 2x 
uporabljeni, se pravokotnik, v katerem je zapisana tipka, obarva rdeče, igra pa nas ne spusti nazaj na main menu, dokler tipke ne zamenjamo. 


V igri je samo en bug: če hočeš takoj na začetku it desno, se bo tvoj movement reverse-al. Da to rešiš, se rabiš zarotirat v levo vsaj 270 stopinj in šele nato se premikat po željeni poti naprej.
