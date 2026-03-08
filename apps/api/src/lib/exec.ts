import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface ExecOptions {
  timeout?: number;
  captureStderr?: boolean;
}

export async function execCommand(
  cmd: string,
  args: string[],
  options: ExecOptions = {}
): Promise<string> {
  const { timeout = 60000, captureStderr = false } = options;
  const { stdout, stderr } = await execFileAsync(cmd, args, {
    timeout,
    maxBuffer: 10 * 1024 * 1024,
    encoding: 'utf-8',
  });
  if (captureStderr) {
    return stderr ?? '';
  }
  return stdout ?? '';
}

/**
 * Parse FFmpeg showinfo filter output (stderr) for scene change pts_time values.
 * Lines look like: [Parsed_showinfo_0 @ 0x...] n: 1 pts: 3000 pts_time: 3.333333
 */
export function parseSceneDetection(showinfoOutput: string): number[] {
  const times: number[] = [];
  const regex = /pts_time:\s*([\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(showinfoOutput)) !== null) {
    const t = parseFloat(m[1]);
    if (!Number.isNaN(t)) times.push(t);
  }
  return times;
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  const out = await execCommand(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ],
    { timeout: 10000 }
  );
  const duration = parseFloat(out.trim());
  return Number.isNaN(duration) ? 0 : duration;
}
