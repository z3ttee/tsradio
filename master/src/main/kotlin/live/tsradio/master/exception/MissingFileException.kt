package live.tsradio.master.exception

import java.io.File

class MissingFileException(file: File): Exception("Could not find file '${file.absolutePath}'")