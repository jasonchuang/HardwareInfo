import SwiftUI
import UniformTypeIdentifiers

@MainActor
final class MarkdownViewModel: ObservableObject {
    @Published var markdownText: String?
    @Published var fileName: String?
    @Published var filePath: URL?

    // MARK: - Open via NSOpenPanel

    func openFile() {
        let panel = NSOpenPanel()
        panel.title = "Open Markdown File"
        panel.allowedContentTypes = [
            UTType(filenameExtension: "md")!,
            UTType(filenameExtension: "markdown") ?? .plainText,
            .plainText
        ]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false

        guard panel.runModal() == .OK, let url = panel.url else { return }
        load(url: url)
    }

    // MARK: - Drag and Drop

    func handleDrop(providers: [NSItemProvider]) -> Bool {
        guard let provider = providers.first else { return false }

        provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier) { item, _ in
            guard
                let data = item as? Data,
                let url = URL(dataRepresentation: data, relativeTo: nil)
            else { return }

            let ext = url.pathExtension.lowercased()
            guard ["md", "markdown", "txt"].contains(ext) else { return }

            Task { @MainActor in
                self.load(url: url)
            }
        }
        return true
    }

    // MARK: - Load File

    private func load(url: URL) {
        do {
            let content = try String(contentsOf: url, encoding: .utf8)
            markdownText = content
            fileName = url.lastPathComponent
            filePath = url

            // Update window title
            NSApp.mainWindow?.title = url.lastPathComponent
            NSApp.mainWindow?.representedURL = url
        } catch {
            // Show error as markdown so the UI remains consistent
            markdownText = "**Error loading file:** \(error.localizedDescription)"
            fileName = url.lastPathComponent
        }
    }
}
