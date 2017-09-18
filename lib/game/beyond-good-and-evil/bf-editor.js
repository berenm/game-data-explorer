/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {BF} from './bf'

class BFEditor extends ArchiveFileEditor(BF) {
}
Serializable.includeInto(BFEditor, __filename)

export default BFEditor
