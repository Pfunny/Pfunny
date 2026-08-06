# CH.FANDRICH Studio 1.1.0

## Release-Schwerpunkt
Version 1.1 erweitert das Studio um datenbasierte KDP- und Business-Funktionen und führt eine aktualisierte Release-Abnahme ein.

## Neu in 1.1
- Sprint 31: KDP-Berichtsimport mit CSV-Vorschau, Validierung und Importhistorie.
- Sprint 32: KDP-Analyse mit Monatswerten, Top-Büchern, Serienauswertung und Export.
- Sprint 33: Marketing Pro mit Kampagnenplanung, Statusverfolgung und Export.
- Sprint 34: KI Business Advisor mit regelbasierten Empfehlungen, Prioritäten und klar gekennzeichneten Schätzungen.
- Sprint 35: Release-Center 1.1, Versionsangleichung und erweiterte Modulabnahme.

## Release-Checkliste
- [x] Versionsnummer der Web-App auf 1.1.0 gesetzt.
- [x] Release-Center auf 1.1 aktualisiert.
- [x] Module aus Sprint 31 bis 34 in die Abnahme aufgenommen.
- [x] JSON-Releasebericht auf Version 1.1 aktualisiert.
- [x] Bekannte Einschränkungen dokumentiert.
- [ ] Automatisierten Build/Typecheck erfolgreich ausführen.
- [ ] Browser-End-to-End-Test erfolgreich ausführen.

## Bekannte Einschränkungen
- KDP-Berichte werden lokal verarbeitet; abweichende Amazon-Berichtsformate können zusätzliche Zuordnungen benötigen.
- Mehrere Währungen werden nicht automatisch umgerechnet.
- Marketing Pro veröffentlicht nicht automatisch auf externen Plattformen.
- Business-Advisor-Empfehlungen sind regelbasiert; Prognosen sind Schätzungen und keine Garantie zukünftiger Verkäufe.
- Die lokale Release-Checkliste ersetzt keine automatisierten CI- oder Browser-Tests.

## Release-Status
Release-Kandidat. Die fachlichen Release-Funktionen sind integriert; automatisierter Build/Typecheck und Browser-E2E bleiben vor einer vollständig getesteten Freigabe offen.
