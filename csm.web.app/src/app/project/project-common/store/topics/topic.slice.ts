/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicListLinks} from '../../api/topics/resources/topic-list.resource';

export class TopicSlice {
    public currentItem: AbstractItem;
    public items: TopicResource[];
    public list: AbstractList<TopicListLinks>;
}
