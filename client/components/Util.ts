export const getRandomInt = (max:number) => Math.floor(Math.random() * Math.floor(max))

export const getTeamColor = (teamId: string, teams:Array<Team>) => {
    let team = teams.find(team => team.id === teamId)
    return team && team.color
}