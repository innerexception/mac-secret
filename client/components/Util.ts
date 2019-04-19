import Words from '../assets/Words.json'

export const getRandomInt = (max:number) => Math.floor(Math.random() * Math.floor(max))

export const getTeamColor = (teamId: string, teams:Array<Team>) => {
    let team = teams.find(team => team.id === teamId)
    return team && team.color
}

export const shuffleArray = (array:Array<any>) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return Array.from(array)
  }

  export const getRandomWord = () => {
        return Words[getRandomInt(Words.length)]
  }