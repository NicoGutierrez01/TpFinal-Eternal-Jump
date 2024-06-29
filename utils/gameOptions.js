export const gameOptions = {
    firstPlatformPosition: 0 / 10, // primer posicion vertical de la plataforma. 0 = parte superior de la pantalla, 1 = parte inferior de la pantalla
    gameGravity: 1200, // gravedad del juego, que solo afecta al player
    heroSpeed: 300, // velocidad del jugador, en pixeles por segundo
    jumpForce: 960, // fuerza del salto del jugador
    platformFixedLength: 130,
    platformSpeed: 5, // velocidad de las plataformas, en pixeles por segundo
    platformLengthRange: [50, 150], // longitud de las plataformas, en pixeles
    platformHorizontalDistanceRange: [0, 250], // rango de distancia horizontal de la plataforma desde el centro del escenario, en pixeles
    platformVerticalDistanceRange: [150, 300] // rango de distancia vertical de la plataforma desde la plataforma anterior, en pixeles
}