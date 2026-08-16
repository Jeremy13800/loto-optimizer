import { parseFdjCsv } from "../lib/fdj-csv-parser";

const VALID_CSV = `annee_numero_de_semaine;date_de_tirage;boule_1;boule_2;boule_3;boule_4;boule_5;numero_chance;rapport_du_rang1;nombre_de_gagnant_au_rang1
2024-01;06/01/2024;3;17;28;39;45;6;0;0
2024-02;10/01/2024;5;11;22;33;44;2;0;0
2024-02;13/01/2024;1;9;18;27;49;10;0;0`;

describe("parseFdjCsv", () => {
  it("parses valid CSV correctly", () => {
    const draws = parseFdjCsv(VALID_CSV);
    expect(draws.length).toBe(3);
  });

  it("converts DD/MM/YYYY to YYYY-MM-DD", () => {
    const draws = parseFdjCsv(VALID_CSV);
    expect(draws[0].dateISO).toBe("2024-01-06");
    expect(draws[1].dateISO).toBe("2024-01-10");
  });

  it("sorts nums ascending", () => {
    const draws = parseFdjCsv(VALID_CSV);
    const nums = draws[0].nums;
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("returns empty array for empty input", () => {
    expect(parseFdjCsv("")).toHaveLength(0);
    expect(parseFdjCsv("header only")).toHaveLength(0);
  });

  it("throws on unrecognized header", () => {
    const badCsv = "col1;col2;col3\n1;2;3";
    expect(() => parseFdjCsv(badCsv)).toThrow();
  });

  it("skips rows with invalid numbers", () => {
    const csv = `annee_numero_de_semaine;date_de_tirage;boule_1;boule_2;boule_3;boule_4;boule_5;numero_chance
2024-01;06/01/2024;0;17;28;39;45;6
2024-01;10/01/2024;5;11;22;33;44;2`;
    const draws = parseFdjCsv(csv);
    expect(draws.length).toBe(1);
  });
});
