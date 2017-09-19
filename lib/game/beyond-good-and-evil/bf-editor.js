/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {BFParser} from './bf-parser'

class BFEditor extends ArchiveFileEditor(BFParser) {
}
Serializable.includeInto(BFEditor, __filename)

export default BFEditor
