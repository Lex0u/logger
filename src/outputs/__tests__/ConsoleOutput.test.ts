import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConsoleOutput } from "../ConsoleOutput";
import { LogLevel } from "../../types";

describe("ConsoleOutput", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("écrit dans la console par défaut (enabled: true implicite)", () => {
    const output = new ConsoleOutput();
    output.log({ level: LogLevel.Information, message: "hello" });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0]![0]).toContain("hello");
  });

  it("n'écrit rien si enabled est false", () => {
    const output = new ConsoleOutput({ enabled: false });
    output.log({ level: LogLevel.Information, message: "hello" });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("filtre les logs en dessous de minLevel", () => {
    const output = new ConsoleOutput({ minLevel: LogLevel.Warning });

    output.log({ level: LogLevel.Debug, message: "trop bas" });
    output.log({ level: LogLevel.Information, message: "trop bas aussi" });
    expect(logSpy).not.toHaveBeenCalled();

    output.log({ level: LogLevel.Warning, message: "ok" });
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("laisse passer un log dont le niveau est égal à minLevel", () => {
    const output = new ConsoleOutput({ minLevel: LogLevel.Error });
    output.log({ level: LogLevel.Error, message: "égal" });

    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("filtre par allowTags quand un tag est fourni", () => {
    const output = new ConsoleOutput({ allowTags: ["App"] });

    output.log({ level: LogLevel.Information, message: "refusé", tag: "DB" });
    expect(logSpy).not.toHaveBeenCalled();

    output.log({ level: LogLevel.Information, message: "accepté", tag: "App" });
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("laisse passer un log sans tag même avec allowTags défini", () => {
    const output = new ConsoleOutput({ allowTags: ["App"] });
    output.log({ level: LogLevel.Information, message: "pas de tag" });

    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("inclut les infos dans la sortie quand showInfos n'est pas désactivé", () => {
    const output = new ConsoleOutput();
    output.log({
      level: LogLevel.Information,
      message: "avec infos",
      infos: { userId: 42 },
    });

    const printed = logSpy.mock.calls[0]![0] as string;
    expect(printed).toContain("userId");
    expect(printed).toContain("42");
  });

  it("n'inclut pas les infos quand showInfos est false", () => {
    const output = new ConsoleOutput({ showInfos: false });
    output.log({
      level: LogLevel.Information,
      message: "sans infos",
      infos: { userId: 42 },
    });

    const printed = logSpy.mock.calls[0]![0] as string;
    expect(printed).not.toContain("userId");
  });
});
