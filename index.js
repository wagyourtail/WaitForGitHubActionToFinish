const { Octokit } = require("@octokit/rest");
const core = require("@actions/core");

const settings = ["auth", "owner", "repo", "workflowID"].reduce((obj, key) => {
	obj[key] = core.getInput(key);
	return obj;
}, {});

const octokit = new Octokit({
	"auth": settings.auth
});

(async () => {
	let success;

	let latestRun = (await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
		"owner": settings.owner,
		"repo": settings.repo,
		"workflow_id": settings.workflowID
	})).data.workflow_runs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

	while (latestRun.status !== "completed") {
		await timeout(30000);

		latestRun = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
			"owner": settings.owner,
			"repo": settings.repo,
			"run_id": latestRun.id
		});
	}

	success = latestRun.conclusion === "success";

	process.exit(success ? 0 : 1);
})();

function timeout (ms) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), ms);
	});
}
