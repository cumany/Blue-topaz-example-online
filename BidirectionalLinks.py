import os
import json
import re

rootDir = 'D:\Documents\GitHub\pkmer-docs'


def get_md_files(directory):
    """
    获取指定文件夹下的所有 Markdown 文件路径。
    """
    md_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                md_file = os.path.join(root, file)
                md_files.append(md_file)
    return md_files


def file_name_exists(md_file, md_files):
    """
    判断是否存在文件名相同的文件，即使路径可能不同。
    """
    file_name = os.path.basename(md_file).lower()  # 将文件名转换为小写，以避免大小写问题
    for file in md_files:
        if os.path.basename(file).lower() == file_name and file != md_file:
            return True
    return False

def get_link_name(str):
    pattern = r"(\w+)(?:#|\^|\|)"
    # 提取匹配的字符串部分
    matches = re.findall(pattern, str)
    if matches:
        return matches[0]
    else:
        return str

def link_name_exists(link, md_files):
    """
    判断是否存在文件名相同的文件，即使路径可能不同。
    """
    count = 0
    duplicate_file = None
    for file in md_files:
        file_name = os.path.splitext(os.path.basename(file))[0]
        if file_name.lower() == link.lower():
            count += 1
            if count > 1:
                return file
    return False


def note_id_from_note(note):
    """
    从笔记中生成唯一的 ID。
    """
    # return "".join(str(ord(char)) for char in note)
    return note


def clean_path(str):
    return str.replace(rootDir, "").replace(rootDir.lower(), "").replace('\\', '/').replace('.md', '')


def process_md_file(md_file, md_files):
    """
    处理单个 Markdown 文件，提取双向链接信息。
    """
    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()
    # 提取双向链接语法，例如 [[note]] 和 [[note|link]]
    link_pattern = r"(?<!`)(?<!``)`*\[\[((?:[^[\]`]|`(?!`))*?)\]\]`*(?!`)(?!``)(?<!`)"
    #删除代码块包裹的内容
    code_block_pattern = r"```.*?```"
    code_blocks = re.findall(code_block_pattern, content, re.DOTALL)

    for code_block in code_blocks:
        content = content.replace(code_block, "")

    links = re.findall(link_pattern, content)

    # link_pattern = r"\[\[(.*?)\]\]"
    # links = re.findall(link_pattern, content)

    file_name = os.path.splitext(os.path.basename(md_file))[0]
    file_path = os.path.dirname(md_file)
    id = file_name
    if file_name_exists(md_file, md_files):
        id = md_file.replace(rootDir, "")

    new_links = []

    for link in links:
        # 判断文件名或路径是否存在
        link= get_link_name(link)
        res = link_name_exists(link, md_files)
        if res:
            new_links.append(clean_path(res))
        else:
            new_links.append(link)
    return {
        "id": clean_path(id),
        "path": clean_path(md_file),
        "links": new_links
    }


def generate_links_graph(directory):
    """
    生成双向链接图谱，并保存为 JSON 文件。
    """
    md_files = get_md_files(directory)
    nodes = []
    edges = []
    for md_file in md_files:
        md_data = process_md_file(md_file, md_files)
        node_id = note_id_from_note(md_data['id'])  # 生成唯一的节点 ID
        nodes.append({
            "id": node_id,
            "path": md_data["path"].lower(),
            "label": os.path.splitext(os.path.basename(md_file))[0]
        })
        for link in md_data["links"]:
            edges.append({
                "source": node_id,  # 使用节点ID作为源
                "target": note_id_from_note(link)
            })

    links_graph = {
        "edges": edges,
        "nodes": nodes
    }

    # 获取节点 id 列表
    node_ids = [node["id"] for node in links_graph["nodes"]]

    # 遍历 edges，更新 source 和 target 的值
    for edge in links_graph["edges"]:
        if edge["source"] not in node_ids:
            edge["source"] = edge["source"].strip()  # 去除边值两侧可能存在的空格
            links_graph["nodes"].append({"id": edge["source"], "path": "", "label": edge["source"]})
            node_ids.append(edge["source"])  # 更新节点 id 列表

        if edge["target"] not in node_ids:
            edge["target"] = edge["target"].strip()  # 去除边值两侧可能存在的空格
            links_graph["nodes"].append({"id": edge["target"], "path": "", "label": edge["target"]})
            node_ids.append(edge["target"])  # 更新节点 id 列表

    with open("./notes_graph.json", "w", encoding="utf-8") as f:
        json.dump(links_graph, f, ensure_ascii=False, indent=4)


# 调用函数生成双向链接图谱


# 调用函数生成双向链接图谱
generate_links_graph(rootDir)

# 调用函数生成双向链接图谱
