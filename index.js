const { Octokit } = require("@octokit/rest");
const core = require("@actions/core");

const settings = ["auth", "owner", "repo", "runID"].reduce((obj, key) => {
	obj[key] = core.getInput(key);
	return obj;
}, {});

const octokit = new Octokit({
	"auth": settings.auth
});

(async () => {
	let latestRun;
	while (latestRun.status !== "completed") {
		await timeout(30000);

		latestRun = (await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
			"owner": settings.owner,
			"repo": settings.repo,
			"run_id": settings.runID
		})).data;

		console.log(`runID: ${settings.runID}`);
		console.log(`run.status: ${latestRun.status}`);
	}

	let success = latestRun.conclusion === "success";

	console.log(`success: ${success}`);

	process.exit(success ? 0 : 1);
})();

function timeout (ms) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), ms);
	});
}
