/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {PCKParser} from './pck-parser'

class PCKEditor extends ArchiveFileEditor(PCKParser) {
}
Serializable.includeInto(PCKEditor, __filename)

export default PCKEditor
