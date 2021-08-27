import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.2.2/types.ts#^";

export class Source extends BaseSource {
  async gatherCandidates(...args: any[]): Promise<Candidate[]> {
    const panes = await this.panes();
    const results = await Promise.all(panes.map((id) => this.capturePane(id)));
    console.log(results)
    return this.allWords(results.flat()).map((word) => ({ word }));
  }

  private async runCmd(cmd: string[]): Promise<string[]> {
    const p = Deno.run({ cmd, stdout: "piped", stderr: "null", stdin: "null" });
    await p.status();
    return new TextDecoder().decode(await p.output()).split(/\n/);
  }

  private async panes(): Promise<string[]> {
    return this.runCmd(["tmux", "list-panes", "-a", "-F", "#D"]);
  }

  private async capturePane(id: string): Promise<string[]> {
    return this.runCmd(["tmux", "capture-pane", "-J", "-p", "-t", id]);
  }

  private allWords(lines: string[]): string[] {
    return lines
      .flatMap((line) => [...line.matchAll(/[a-zA-Z0-9_]+/g)])
      .map((match) => match[0])
      .filter((e, i, self) => self.indexOf(e) === i);
  }
}
