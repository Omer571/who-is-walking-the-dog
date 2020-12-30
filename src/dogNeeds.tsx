
type dogNeeds = {
  walks: number,
  rest: number,
  outings: number


}

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

export let dayTypes = ["Walk", "Outing", "Rest"]
export let walks = 4
export let outings = 2
export let rest = 1
export let condition = (walks + outings + rest) === 7

assert(condition, "The number of walks, outings, and rest should be 7 (7 days in a week)")
