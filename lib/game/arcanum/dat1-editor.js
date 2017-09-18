/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DAT1} from './dat1'

class DAT1Editor extends ArchiveFileEditor(DAT1) {
}
Serializable.includeInto(DAT1Editor, __filename)

export default DAT1Editor
