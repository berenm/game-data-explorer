/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DIRParser} from './dir-parser'

class DIREditor extends ArchiveFileEditor(DIRParser) {
}
Serializable.includeInto(DIREditor, __filename)

export default DIREditor
